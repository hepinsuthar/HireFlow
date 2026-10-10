import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Checking API...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage("Unable to connect to HireFlow API");
      });
  }, []);

  return (
    <div>
      <h1>HireFlow</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;