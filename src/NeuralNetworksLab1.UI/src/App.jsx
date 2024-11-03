import { useState, useRef, useEffect } from "react";

function App() {
    const [point, setPoint] = useState({ x: null, y: null });
    const [points, setPoints] = useState([]);
    const [isTraining, setIsTraining] = useState(true);
    const [line, setLine] = useState(null);
    const canvasRef = useRef(null);

    const drawGrid = (ctx) => {
        const size = 26;
        const step = ctx.canvas.width / size;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = '#0000002b';
        ctx.lineWidth = 1;

        for (let i = 0; i <= size; i++) {
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
		const size = ctx.canvas.width / 26;
		const radius = 4;
		ctx.beginPath();
		ctx.arc(x * size, (25 - y) * size, radius, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
	};
	
    const drawLine = (ctx, slope, intercept) => {
		const size = ctx.canvas.width / 26;
		const x1 = 0;
		const y1 = intercept;
		const x2 = 25;
		const y2 = slope * x2 + intercept;
		ctx.beginPath();
		ctx.moveTo(x1 * size, (25 - y1) * size);
		ctx.lineTo(x2 * size, (25 - y2) * size);
		ctx.strokeStyle = 'blue';
		ctx.stroke();
	};
	
    const handleCanvasClick = async event => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((event.clientX - rect.left) / (rect.width / 26));
		const y = 25 - Math.floor((event.clientY - rect.top) / (rect.height / 26));
	
		if (isTraining) {
			const color = prompt("Введіть колір точки (червоний або синій для тренування):");
			const result = color === "червоний" ? 1 : 0;
			setPoints([...points, { x, y, result }]);
		} else {
			const response = await fetch("http://localhost:5284/perceptron/predict", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ x, y })
			});
			const data = await response.json();
			const color = data.prediction === 1 ? "red" : "blue";
			setPoint({ x, y, color });
		}
	};
	

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        drawGrid(ctx);
        points.forEach(point => {
            drawPoint(ctx, point.x, point.y, point.result === 1 ? "red" : "blue");
        });

        if (line) {
            drawLine(ctx, line.slope, line.intercept);
        }

        if (point.x !== null && point.y !== null && !isTraining) {
            drawPoint(ctx, point.x, point.y, point.color);
        }
    }, [points, point, line]);

    const trainPerceptron = async () => {
        const response = await fetch("http://localhost:5284/perceptron/train?learningRate=0.01", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(points)
        });
        const data = await response.json();
        setLine({ slope: data.slope, intercept: data.intercept });
        setIsTraining(false);
    };

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <canvas ref={canvasRef} width={450} height={450} style={{ border: '1px solid black', cursor: 'crosshair' }} onClick={handleCanvasClick}></canvas>
                <div style={{ marginTop: '20px' }}>
                    <p>X: {point.x !== null ? point.x : '-_-'}, Y: {point.y !== null ? 25 - point.y : '-_-'}</p>
                    {isTraining && <button onClick={trainPerceptron}>Тренувати перцептрон</button>}
                </div>
            </div>
        </>
    )
}

export default App;
