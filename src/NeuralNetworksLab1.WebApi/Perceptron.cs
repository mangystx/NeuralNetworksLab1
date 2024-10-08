using NeuralNetworksLab1.Contracts;

namespace NeuralNetworksLab1.WebApi;

public class Perceptron
{
	private double[] _weights = new double[2];
	private double _bias;
	public double LearningRate { private get; set; } = 0.01;
	
	private static Perceptron? _instance;
	
	private Perceptron()
	{
		var rnd = new Random();
		for (var i = 0; i < _weights.Length; i++)
		{
			_weights[i] = rnd.NextDouble();
		}
	}
	
	public static Perceptron Instance()
	{
		return _instance ??= new Perceptron();
	}
	
	public int Predict(Point point) => _bias + _weights[0] * point.X + _weights[1] * point.Y >= 0 ? 1 : 0;
	
	public void Train(TrainingPoint point)
	{
		var prediction = Predict(new Point(point.X, point.Y));
		var error = point.Result - prediction;
		
		_weights[0] += LearningRate * error * point.X;
		_weights[1] += LearningRate * error * point.Y;
		
		_bias += LearningRate * error;
	}
}