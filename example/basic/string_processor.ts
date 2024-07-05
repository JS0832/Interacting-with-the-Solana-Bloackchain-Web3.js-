export function allSubstrings(s: string, minLength: number): string[] {
    // Convert to lowercase and remove spaces
    s = s.toLowerCase().replace(/\s+/g, '');

    const length = s.length;
    const substrings: string[] = [];

    // Loop to consider every possible starting point of a substring
    for (let i = 0; i < length; i++) {
        // Loop to consider every possible ending point of a substring
        for (let j = i + 1; j <= length; j++) {
            const substring = s.substring(i, j);
            if (substring.length >= minLength) {
                substrings.push(substring);
            }
        }
    }

    return substrings;
}


// Function to count the occurrences of each string in the list
function countStrings(arr: string[]): { [key: string]: number } {
const counts: { [key: string]: number } = {};

arr.forEach((str) => {
    counts[str] = (counts[str] || 0) + 1;
});

return counts;
}
  
  // Function to sort strings by their counts in descending order
function sortStringsByCount(counts: { [key: string]: number }): [string, number][] {
const sortedEntries: [string, number][] = Object.entries(counts).sort(
    (a, b) => b[1] - a[1]
);

return sortedEntries;
}
  
  // Main function to count and sort strings
export function countAndSortStrings(arr: string[]): [string, number][] {
    const counts = countStrings(arr);
    return sortStringsByCount(counts);
  }