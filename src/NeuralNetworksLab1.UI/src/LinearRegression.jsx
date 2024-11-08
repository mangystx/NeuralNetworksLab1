import React, { useState, useRef } from "react";

function LinearRegression() {
    const [trainingData, setTrainingData] = useState([]);
    const [prediction, setPrediction] = useState(0);
    const [xValue, setXValue] = useState("");
    const [regressionLine, setRegressionLine] = useState(null);
    const xRef = useRef();
    const yRef = useRef();

    const handleAddData = () => {
        const x = parseFloat(xRef.current.value);
        const y = parseFloat(yRef.current.value);
        if (x >= 0 && x <= 40 && y >= 0 && y <= 25) {
            setTrainingData([...trainingData, { x, y }]);
            xRef.current.value = "";
            yRef.current.value = "";
        } else {
            alert("Значення X повинно бути від 0 до 40, а Y – від 0 до 25.");
        }
    };

    const handleTrain = async () => {
        const x = trainingData.map((d) => d.x);
        const y = trainingData.map((d) => d.y);
        const response = await fetch("http://localhost:5284/linear-regression/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ x, y })
        });
        const data = await response.json();
        setRegressionLine([data.slope, data.intercept]);
    };

    const handlePredict = async () => {
        const x = parseFloat(xValue);
        const response = await fetch("http://localhost:5284/linear-regression/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(x)
        });
        const data = await response.json();
        setPrediction(data.prediction);
    };

    const renderRegressionLine = () => {
        if (!regressionLine) return null;

        const [slope, intercept] = regressionLine;
        const xMin = 0;
        const xMax = 40;
        const yMin = slope * xMin + intercept;
        const yMax = slope * xMax + intercept;

        return (
            <line
                x1={xMin * 10} y1={200 - yMin * 10}
                x2={xMax * 10} y2={200 - yMax * 10}
                stroke="blue" strokeWidth="2"
            />
        );
    };

    return (
        <div className="linear-regression-container">
            <h1>Прогнозування лінійної регресії</h1>
            <div>
                <h2>Додати дані для тренування</h2>
                <div className="training-data-inputs">
                    <input
                        ref={xRef}
                        placeholder="значення X"
                        type="number"
                        step="any"
                        min="0"
                        max="40"
                        className="training-data-input"
                    />
                    <input
                        ref={yRef}
                        placeholder="значення Y"
                        type="number"
                        step="any"
                        min="0"
                        max="25"
                        className="training-data-input"
                    />
                </div>
                <button onClick={handleAddData}>Додати дані</button>
                <ul className="training-data-list">
                    {trainingData.map((d, i) => (
                        <li key={i}>
                            X: {d.x}, Y: {d.y}
                        </li>
                    ))}
                </ul>
                <button onClick={handleTrain}>Тренувати</button>
            </div>
            <div>
                <h2>Зробити прогнозування</h2>
                <div className="prediction-inputs">
                    <input
                        value={xValue}
                        onChange={(e) => setXValue(e.target.value)}
                        placeholder="значення X"
                        type="number"
                        step="any"
                        min="0"
                        max="40"
                        className="prediction-input"
                    />
                    <button onClick={handlePredict}>Прогноз</button>
                </div>
                <p className="prediction-output">
                    X: {xValue}, Y: {prediction}
                </p>
            </div>
            <div>
                <h2>Лінійна регресія</h2>
                <svg width="400" height="200" style={{ border: "1px solid black" }}>
                    {trainingData.map((point, index) => (
                        <circle
                            key={index}
                            cx={point.x * 10}
                            cy={200 - point.y * 10}
                            r="3"
                            fill="red"
                        />
                    ))}
                    {renderRegressionLine()}
                </svg>
            </div>
        </div>
    );
}

export default LinearRegression;