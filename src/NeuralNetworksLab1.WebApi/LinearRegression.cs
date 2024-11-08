namespace NeuralNetworksLab1.WebApi;

public class LinearRegression
{
    public double[] Weights { get; private set; }
    public double Bias { get; private set; }

    public LinearRegression()
    {
        Weights = new double[1];
        Bias = 0;
    }

    public void Train(double[] x, double[] y)
    {
        if (x.Length != y.Length)
            throw new ArgumentException("Length of x and y must be the same.");

        var n = x.Length;
        var meanX = x.Average();
        var meanY = y.Average();

        double sumXY = 0;
        double sumXX = 0;

        for (var i = 0; i < n; i++)
        {
            sumXY += (x[i] - meanX) * (y[i] - meanY);
            sumXX += (x[i] - meanX) * (x[i] - meanX);
        }

        Weights[0] = sumXY / sumXX;
        Bias = meanY - Weights[0] * meanX;
    }

    public double Predict(double x) =>  Weights[0] * x + Bias;
}