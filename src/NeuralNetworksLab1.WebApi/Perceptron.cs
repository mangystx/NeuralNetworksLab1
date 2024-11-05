using NeuralNetworksLab1.Contracts;

namespace NeuralNetworksLab1.WebApi;

public class Perceptron
{
    public double[] Weights { get; } = new double[2];
    public double Bias { get; private set; }
    public double LearningRate { get; set; } = 0.01;

    public Perceptron()
    {
        InitializeWeights();
    }

    public void InitializeWeights()
    {
        var rnd = new Random();
        for (var i = 0; i < Weights.Length; i++)
        {
            Weights[i] = rnd.NextDouble();
        }
        Bias = rnd.NextDouble();
    }

    public int Predict(Point point) => Bias + Weights[0] * point.X + Weights[1] * point.Y >= 0 ? 1 : 0;

    public void Train(TrainingPoint point)
    {
        var prediction = Predict(new Point(point.X, point.Y));
        var error = point.Result - prediction;

        Weights[0] += LearningRate * error * point.X;
        Weights[1] += LearningRate * error * point.Y;

        Bias += LearningRate * error;
    }

    public bool TrainMultiple(TrainingPoint[] points, int iterations)
    {
        for (var i = 0; i < iterations; i++)
        {
            foreach (var point in points)
            {
                Train(point);
            }
        }
        
        return points.All(point => Predict(new Point(point.X, point.Y)) == point.Result);
    }
}
