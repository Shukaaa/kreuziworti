const fs = require('fs');
const path = require('path');
require("jsonminify"); // adds JSON.minify

const packagesPath = path.join(__dirname, 'packages-raw');
const outputJsonPath = path.join(__dirname, 'kreuziworti', 'src', 'assets', 'data');
const orderJson = require(path.join(packagesPath, 'order.json'));

fs.readdirSync(outputJsonPath).forEach((file) => {
	fs.unlinkSync(path.join(outputJsonPath, file));
});

fs.readdirSync(packagesPath).forEach((categoryFolder) => {
	if (fs.lstatSync(path.join(packagesPath, categoryFolder)).isFile()) {
		return;
	}

	const categoryJson = require(path.join(packagesPath, categoryFolder, 'category.json'));
	const puzzlesFolderPath = path.join(packagesPath, categoryFolder, 'puzzles');
	categoryJson.puzzles = fs.readdirSync(puzzlesFolderPath).map((puzzleJson) => {
		return require(path.join(puzzlesFolderPath, puzzleJson));
	});
	const finalJson = JSON.minify(JSON.stringify(categoryJson, null));
	fs.writeFileSync(path.join(outputJsonPath, `${categoryFolder}.json`), finalJson);
});

const categoriesJson = JSON.minify(JSON.stringify(orderJson));
fs.writeFileSync(path.join(outputJsonPath, '_categories.json'), categoriesJson);

const rawSize = fs.readdirSync(packagesPath).reduce((totalSize, categoryFolder) => {
	if (fs.lstatSync(path.join(packagesPath, categoryFolder)).isFile()) {
		return totalSize + fs.statSync(path.join(packagesPath, categoryFolder)).size;
	}

	const categorySize = fs.readdirSync(path.join(packagesPath, categoryFolder)).reduce((totalCategorySize, file) => {
		const puzzlesSize = fs.readdirSync(path.join(packagesPath, categoryFolder, "puzzles")).reduce((totalPuzzleSize, puzzle) => {
			return totalPuzzleSize + fs.statSync(path.join(packagesPath, categoryFolder, "puzzles", puzzle)).size;
		}, 0);
		return totalCategorySize + fs.statSync(path.join(packagesPath, categoryFolder, file)).size + puzzlesSize;
	}, 0);
	return totalSize + categorySize;
}, 0);

const minifiedSize = fs.readdirSync(outputJsonPath).reduce((totalSize, file) => {
	return totalSize + fs.statSync(path.join(outputJsonPath, file)).size;
}, 0);

const bytesToKb = (bytes) => {
	return (bytes / 1024).toFixed(2);
}

console.log(`Raw size: ${bytesToKb(rawSize)}kb`);
console.log(`Minified size: ${bytesToKb(minifiedSize)}kb`);
console.log(`Saved: ${bytesToKb(rawSize - minifiedSize)}kb (${((rawSize / minifiedSize) * 100).toFixed(2)}%)`);