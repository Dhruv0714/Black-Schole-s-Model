const btn = document.getElementById("themeToggle");

btn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  // Switch icon
  btn.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";

    plotHeatmap();
});

function isDarkMode() {
  return document.body.classList.contains("dark");
}

function getPlotlyTheme() {
  const dark = isDarkMode();

  return {
    paper_bgcolor: dark ? "#0b0b0b" : "#ffffff",
    plot_bgcolor: dark ? "#0b0b0b" : "#ffffff",
    font: {
      color: dark ? "#eaeaea" : "#111111"
    },
    xaxis: {
      gridcolor: dark ? "#333" : "#ddd",
      zerolinecolor: dark ? "#444" : "#ccc"
    },
    yaxis: {
      gridcolor: dark ? "#333" : "#ddd",
      zerolinecolor: dark ? "#444" : "#ccc"
    }
  };
}

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
        await plotHeatmap(); 
    }
});

function drawHeatmaps(data) {

    const theme = getPlotlyTheme();

    if (!data.call_prices || data.call_prices.length === 0) {
        console.error("Empty heatmap data");
        return;
    }

    Plotly.newPlot("callHeatmap", [{
        x: data.spots,
        y: data.strikes,
        z: data.call_prices,
        type: "heatmap",
        colorscale: "RdYlGn"
    }], {
        title: "Call Price Heatmap",
        xaxis: { title: "Spot Price" },
        yaxis: { title: "Strike Price" },
        ...theme
    });

    Plotly.newPlot("putHeatmap", [{
        x: data.spots,
        y: data.strikes,
        z: data.put_prices,
        type: "heatmap",
        colorscale: "RdYlGn"
    }], {
        title: "Put Price Heatmap",
        xaxis: { title: "Spot Price" },
        yaxis: { title: "Strike Price" },
        ...theme
    });
}


async function plotHeatmap() {
    const S = parseFloat(document.getElementById("S").value);
    const K = parseFloat(document.getElementById("K").value);
    const T = parseFloat(document.getElementById("T").value);
    const r = parseFloat(document.getElementById("r").value);
    const sigma = parseFloat(document.getElementById("sigma").value);

    const response = await fetch("/api/spot-strike-heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ S, K, T, r, sigma })
    });

    const data = await response.json();
    drawHeatmaps(data);
}

let debounceTimer;

function autoUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        document.getElementById("calcBtn").click();
    }, 200);
}




function attachSlider(id, valueId) {
    const slider = document.getElementById(id);
    const value = document.getElementById(valueId);

    slider.addEventListener("input", () => {
        value.innerText = slider.value;
        autoUpdate();
    });
}

attachSlider("S", "S_val");
attachSlider("K", "K_val");
attachSlider("T", "T_val");
attachSlider("r", "r_val");
attachSlider("sigma", "sigma_val");



