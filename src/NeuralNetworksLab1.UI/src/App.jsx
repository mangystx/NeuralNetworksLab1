import { useState, useRef, useEffect } from "react";

function App() {
	const [point, setPoint] = useState({ x: null, y: null });
	const canvasRef = useRef(null);

	const drawGrid = (ctx) => {
		const size = 26;
		const step = ctx.canvas.width / size;

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.strokeStyle = '#0000002b'
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

	const drawPoint = (ctx, x, y) => {
		const size = ctx.canvas.width / 26;
		const radius = 4;
		ctx.beginPath();
		ctx.arc(x * size, y * size, radius, 0, 2 * Math.PI);
		ctx.fillStyle = 'red';
		ctx.fill();
	};

	const handleCanvasClick = event => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const x = Math.floor((event.clientX - rect.left) / (rect.width / 26));
		const y = Math.floor((event.clientY - rect.top) / (rect.height / 26));
		
		setPoint({ x, y });
	}

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		drawGrid(ctx);

		if (point.x !== null && point.y !== null) {
			drawPoint(ctx, point.x, point.y);
		}
	}, [point]);

	return (
		<>
			<div style={{ textAlign: 'center' }}>
				<canvas ref={canvasRef} width={450} height={450} style={{ border: '1px solid black', cursor: 'crosshair' }} onClick={handleCanvasClick}></canvas>
				<div style={{ marginTop: '20px' }}>
					<p>X: {point.x !== null ? point.x : '-_-'}, Y: {point.y !== null ? 25 - point.y : '-_-'}</p>
				</div>
			</div>
		</>
	)
}

export default App
