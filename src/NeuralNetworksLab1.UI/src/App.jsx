import { useState, useRef, useEffect } from "react";
import LinearRegression from "./LinearRegression";
import "./css/style.css";

function App() {
    const [mode, setMode] = useState("auto");
    const [stepMode, setStepMode] = useState("manual");
    const [interval, setInterval] = useState(1000);
    const [isTraining, setIsTraining] = useState(true);
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [point, setPoint] = useState({ x: null, y: null, color: null });
    const [points, setPoints] = useState([]);
    const [line, setLine] = useState(null);
    const canvasRef = useRef(null);
    const canvSize = 26;
    const timerRef = useRef(null);

    const drawGrid = (ctx) => {
        const step = ctx.canvas.width / canvSize;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = '#0000002b';
        ctx.lineWidth = 1;

        for (let i = 0; i <= canvSize; i++) {
            const pos = i * step;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, ctx.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(ctx.canvas.width, pos);
            ctx.stroke();
        }
    };

    const drawPoint = (ctx, x, y, color) => {
        const size = ctx.canvas.width / canvSize;
        const radius = 4;
        ctx.beginPath();
        ctx.arc(x * size, (canvSize - 1 - y) * size, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    };

    const drawLine = (ctx, slope, intercept) => {
        const size = ctx.canvas.width / canvSize;
        const x1 = 0;
        const y1 = intercept;
        const x2 = canvSize + 1;
        const y2 = slope * x2 + intercept;
        ctx.beginPath();
        ctx.moveTo(x1 * size, (canvSize - 1 - y1) * size);
        ctx.lineTo(x2 * size, (canvSize - 1 - y2) * size);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
    };

    const handleCanvasClick = async (event) => {
        event.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / (rect.width / canvSize));
        const y = canvSize - 1 - Math.floor((event.clientY - rect.top) / (rect.height / canvSize));
        let color = "blue";

        if (event.type === 'contextmenu') {
            color = "red";
        }

        if (isTraining) {
            const result = color === "red" ? 1 : 0;
            setPoints([...points, { x, y, result }]);
        } else {
            const response = await fetch("http://localhost:5284/perceptron/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ x, y })
            });
            const data = await response.json();
            color = data.prediction === 1 ? "red" : "blue";
            setPoint({ x, y, color });
        }

        setPoint({ x, y, color });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        drawGrid(ctx);
        points.forEach((point) => {
            drawPoint(ctx, point.x, point.y, point.result === 1 ? "red" : "blue");
        });

        if (line) {
            drawLine(ctx, line.slope, line.intercept);
        }

        if (point.x !== null && point.y !== null && !isTraining) {
            drawPoint(ctx, point.x, point.y, point.color);
        }
    }, [points, point, line]);

    const trainStepPerceptron = async () => {
        try {
            const response = await fetch("http://localhost:5284/perceptron/train-step", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(points)
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message);
                setPoints([]);
                setLine(null);
                return;
            }

            const data = await response.json();

            if (data.slope === null || data.intercept === null) {
                alert(data.message);
                setPoints([]);
                setLine(null);
            } else {
                setLine({ slope: data.slope, intercept: data.intercept });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const stopTraining = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsTraining(false);
    };

    const trainPerceptron = async () => {
        const response = await fetch("http://localhost:5284/perceptron/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(points)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            setPoints([]);
            setLine(null);
            return;
        }

        const data = await response.json();

        if (data.slope === null || data.intercept === null) {
            alert(data.message);
            setPoints([]);
            setLine(null);
        } else {
            setLine({ slope: data.slope, intercept: data.intercept });
            setIsTraining(false);
        }
    };

    const startAutoTraining = () => {
        setIsButtonClicked(true);
        if (typeof interval !== 'number' || interval <= 0) {
            console.error("Invalid interval value:", interval);
            return;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = window.setInterval(() => {
            trainStepPerceptron();
        }, interval);

    };

    const handleTrainButtonClick = () => {
        if (mode === "auto") {
            trainPerceptron();
        } else if (mode === "step") {
            if (stepMode === "manual") {
                trainStepPerceptron();
            } else if (stepMode === "timed") {
                startAutoTraining();
            }
        }
    };

    return (
        <>
            <div className="app">
                <div className="controls">
                    <select value={mode} onChange={(e) => setMode(e.target.value)}>
                        <option value="auto">Автоматичний</option>
                        <option value="step">Покроковий</option>
                    </select>
                    {mode === "step" && (
                        <div className="step-options">
                            <label className="step-options__element">
                                <input
                                    type="radio"
                                    value="manual"
                                    checked={stepMode === "manual"}
                                    onChange={(e) => setStepMode(e.target.value)}
                                />
                                Вручну
                            </label>
                            <label className="step-options__element">
                                <input
                                    type="radio"
                                    value="timed"
                                    checked={stepMode === "timed"}
                                    onChange={(e) => setStepMode(e.target.value)}
                                />
                                Автоматично (через час)
                            </label>
                            <div className="interval-input step-options__element" style={{ visibility: stepMode === "timed" ? 'visible' : 'hidden' }}>
                                <label>
                                    Інтервал (мс):
                                    <input
                                        type="number"
                                        value={interval ?? 1000}
                                        onChange={(e) => setInterval(Number(e.target.value))}
                                        min="100"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                <div className="canvas-container">
                    <canvas
                        ref={canvasRef}
                        width={450}
                        height={450}
                        className="canvas"
                        onClick={handleCanvasClick}
                        onContextMenu={handleCanvasClick}
                    ></canvas>
                    <p className="point-data">
                        X: {point.x !== null ? point.x : '-_-'}, Y: {point.y !== null ? canvSize - 1 - point.y : '-_-'},
                        Колір: {point.color === "blue" ? "синій" : "червоний"}
                    </p>
                    {isTraining && (
                        <>
                            {!(mode === "step" && stepMode === "timed" && isButtonClicked) && (
                                <button onClick={handleTrainButtonClick}>
                                    Тренувати перцептрон
                                </button>
                            )}
                            <button
                                onClick={stopTraining}
                                style={{ visibility: isTraining && mode === "step" ? 'visible' : 'hidden', marginTop: '10px' }}
                            >
                                Зупинити тренування
                            </button>
                        </>
                    )}
                </div>
                <div className="table-container">
                    <table className="points-table">
                        <thead>
                            <tr>
                                <th>X</th>
                                <th>Y</th>
                                <th>Колір</th>
                            </tr>
                        </thead>
                        <tbody>
                            {points.map((point, index) => (
                                <tr key={index}>
                                    <td>{point.x}</td>
                                    <td>{point.y}</td>
                                    <td style={{ color: point.result === 1 ? 'red' : 'blue' }}>
                                        {point.result === 1 ? 'червоний' : 'синій'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <LinearRegression />
        </>
    );
}

export default App;