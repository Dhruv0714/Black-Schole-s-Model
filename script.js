document.getElementById("calcBtn").addEventListener("click", async () => {
    const data = {
        S: document.getElementById("S").value,
        K: document.getElementById("K").value,
        T: document.getElementById("T").value,
        r: document.getElementById("r").value,
        sigma: document.getElementById("sigma").value
    };

    const response = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    const output = document.getElementById("output");

    if (result.error) {
        output.innerText = "Error: " + result.error;
        output.style.color = "red";
    } else {
        output.style.color = "black";
        output.innerText = `Call: ${result.call} | Put: ${result.put}`;
    }
});

