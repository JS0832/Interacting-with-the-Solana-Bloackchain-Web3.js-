const emojis: string[] = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😜", "😝", "😛", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐",
    "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌",
    "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧",
    "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁",
    "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥",
    "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱",
    "😤", "😡", "😠", "🤬", "😈", "👿",
    "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻",
    "😼", "😽", "🙀", "😿", "😾"
];

function getRandomEmoji(): string {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
}

export function getRandomEmojis(max: number): string {
    const numberOfEmojis = Math.floor(Math.random() * max) + 1; // Random number between 1 and max
    const randomEmojis: string[] = [];
    for (let i = 0; i < numberOfEmojis; i++) {
        randomEmojis.push(getRandomEmoji());
    }
    return randomEmojis.join(' ');
}

//const randomEmojis = getRandomEmojis(10);
//console.log("Random Emojis: ", randomEmojis.join(' '));
