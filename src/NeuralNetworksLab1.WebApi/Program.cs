using NeuralNetworksLab1.Contracts;
using NeuralNetworksLab1.WebApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapPost("perceptron/train", (TrainingPoint[] data, double learningRate) =>
{
	var perceptron = Perceptron.Instance();
	perceptron.LearningRate = learningRate;

	foreach (var p in data)
	{
		perceptron.Train(p);
	}
	
	return Results.Ok("Training complete");
})
.WithName("TrainPerceptron")
.WithOpenApi();

app.MapPost("perceptron/predict", (Point point) =>
{
	var perceptron = Perceptron.Instance();
	var prediction = perceptron.Predict(point);
	
	return Results.Ok(new { Prediction = prediction });
})
.WithName("PredictPerceptron")
.WithOpenApi();

app.Run();