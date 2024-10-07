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

app.MapPost("perceptron/train", (TrainingData data) =>
{
	var perceptron = PerceptronService.Instance;
	perceptron.SetLearningRate(data.LearningRate);

	for (var i = 0; i < data.X.length; i++)
	{
		double[] inputs = [data.X[i], data.Y[i]];
		perceptron.Train(inputs, data.Lables[i]);
	}
	
	return Results.Ok("Training complete");
})
.WithName("TrainPerceptron")
.WithOpenApi();

app.MapPost("perceptron/predict", (double[] coordinates) =>
{
	var perceptron = PerceptronService.Instance;
	int prediction = perceptron.Predict(coordinates);
	
	return Results.Ok(new { Prediction = prediction });
})
.WithName("PredictPerceptron")
.WithOpenApi();

app.Run();