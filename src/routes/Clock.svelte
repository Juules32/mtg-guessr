<script lang="ts">

    // Props
    export let maxTime;
    export let remainingTime;

    // Constants
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    
    const interpolateColor = (
        startColor: number[],
        endColor: number[],
        percentage: number,
    ) => {
        const result = startColor.slice();
        for (let i = 0; i < 3; i++) {
            result[i] = Math.round(
                result[i] + percentage * (endColor[i] - startColor[i]),
            );
        }
        return `rgb(${result[0]},${result[1]},${result[2]})`;
    };

    const green = [0, 255, 0];
    const red = [255, 0, 0];

    $: dashOffset = circumference + remainingTimeFraction * circumference;
    $: remainingTimeFraction = remainingTime / maxTime;
    $: strokeColor = interpolateColor(green, red, 1 - remainingTimeFraction);
</script>

<svg width="120" height="120" viewBox="0 0 120 120">
    <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#e6e6e6"
        stroke-width="10"
    />
    <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={strokeColor}
        stroke-width="10"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
        stroke-linecap="round"
        transform="rotate(-90 60 60)"
    />
    <text
        x="60"
        y="60"
        text-anchor="middle"
        dy="0.3em"
        font-size="20"
        fill="black"
    >
        {remainingTime.toFixed(2)}
    </text>
</svg>
