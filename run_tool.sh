cd backend/src && python server.py &
PYTHON_PID=$!

trap "kill $PYTHON_PID 2>/dev/null; wait $PYTHON_PID 2>/dev/null" EXIT SIGTERM SIGINT SIGHUP

cd frontend
npm install
npm run dev