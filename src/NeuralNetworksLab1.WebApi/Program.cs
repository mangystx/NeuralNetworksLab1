using Microsoft.AspNetCore.Mvc;
using NeuralNetworksLab1.Contracts;
using NeuralNetworksLab1.WebApi;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.AddSingleton<Perceptron>();
builder.Services.AddSingleton<LinearRegression>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.Use(async (context, next) =>
{
    var logger = app.Logger;
    logger.LogInformation("Handling request: {Method} {Url}", context.Request.Method, context.Request.Path);

    await next.Invoke();

    logger.LogInformation("Response: {StatusCode}", context.Response.StatusCode);
});

app.MapPost("perceptron/train", (Perceptron perceptron, TrainingPoint[] data) =>
{
    perceptron.InitializeWeights();

    var isSeparable = perceptron.TrainMultiple(data, 5000);

    if (!isSeparable)
        return Results.BadRequest(new { Message = "Не можливо лінійно розділити точки", Slope = (double?)null, Intercept = (double?)null });

    if (perceptron.Weights[1] == 0)
        return Results.Problem("Не вдалося обчислити нахил та перетин, оскільки Weights[1] дорівнює нулю.");

    var slope = -perceptron.Weights[0] / perceptron.Weights[1];
    var intercept = -perceptron.Bias / perceptron.Weights[1];

    return Results.Ok(new { Message = "Training complete", Slope = slope, Intercept = intercept });
})
.WithName("TrainPerceptron")
.WithOpenApi();

app.MapPost("perceptron/train-step", (Perceptron perceptron, TrainingPoint[] points) =>
{
    if (perceptron.Weights == null || perceptron.Bias == null)
    {
        perceptron.InitializeWeights();
    }
    
    perceptron.Train(points);
    
    var slope = -perceptron.Weights[0] / perceptron.Weights[1];
    var intercept = -perceptron.Bias / perceptron.Weights[1];

    return Results.Ok(new { Message = "Step complete", Slope = slope, Intercept = intercept });
})
.WithName("TrainStepPerceptron")
.WithOpenApi();

app.MapPost("perceptron/predict", (Perceptron perceptron, Point point) =>
{
    var prediction = perceptron.Predict(point);

    return Results.Ok(new { Prediction = prediction });
})
.WithName("PredictPerceptron")
.WithOpenApi();

app.MapPost("/linear-regression/train", (LinearRegression lr, [FromBody] LinearRegressionTrainingData data) =>
{
    try
    {
        lr.Train(data.X.ToArray(), data.Y.ToArray());
        return Results.Ok(new { Message = "Training complete", Slope = lr.Weights[0], Intercept = lr.Bias });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
})
.WithName("TrainLinearRegression")
.WithOpenApi();



app.MapPost("/linear-regression/predict", (LinearRegression lr, [FromBody] double x) =>
{
    try
    {
        var prediction = lr.Predict(x);
        return Results.Ok(new { Prediction = prediction });
    }
    catch (Exception ex)
    {   
        return Results.Problem(ex.Message);
    }
})
.WithName("PredictLinearRegression")
.WithOpenApi();

app.Run();