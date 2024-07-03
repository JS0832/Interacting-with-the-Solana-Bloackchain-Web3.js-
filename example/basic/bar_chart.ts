function calculatePercentages(data: [string, number,string,number][]): [string, number][] {
    const totalScore = data.reduce((sum, [, score]) => sum + score, 0);
    return data.map(([name, score,]) => [name, (score / totalScore) * 100]);
}

export function printBarChart(data: [string,number,string,number][]): void {
    const percentages = calculatePercentages(data);

    // Find the longest name for formatting
    const maxNameLength = Math.max(...data.map(([name]) => name.length));
    console.log('         ');
    console.log('Meta finder v1');
    console.log('---------');

    percentages.forEach(([name, percentage]) => {
        const barLength = Math.round(percentage); // Adjust scale if necessary
        const bar = '█'.repeat(barLength);
        console.log(`${name.padEnd(maxNameLength)} | ${bar} ${percentage.toFixed(2)}% TPM : ${data[0][3]}`);
    });
}
