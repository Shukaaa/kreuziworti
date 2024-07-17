(function () {
	let solutionWord = '';
	let finalWordLetters = [];

	// Funktion zum Erstellen des dynamischen Formulars
	function createDynamicForm(minX, maxX, minY, maxY) {
		// Erstellen des Container-Divs
		const container = document.createElement('div');
		container.id = 'dynamicFormContainer';
		container.style.margin = '20px';
		container.style.padding = '10px';
		container.style.border = '1px solid #ccc';
		container.style.borderRadius = '5px';
		container.style.width = '300px';
		container.style.float = 'left';
		container.style.clear = 'left';
		container.style.marginTop = '40px';
		container.style.marginLeft = '310px';

		// Überschrift hinzufügen
		const header = document.createElement('h3');
		header.innerText = 'Lösungswort Eingabeformular';
		container.appendChild(header);

		// Gesamtes Wort anzeigen
		const wordDisplay = document.createElement('div');
		wordDisplay.id = 'wordDisplay';
		wordDisplay.style.marginBottom = '20px';
		wordDisplay.style.fontWeight = 'bold';
		updateSolutionWordDisplay(wordDisplay);
		container.appendChild(wordDisplay);

		// Initiales Formularfeld hinzufügen
		addFormField(container, minX, maxX, minY, maxY);

		// Schaltfläche zum Hinzufügen neuer Felder
		const addButton = document.createElement('button');
		addButton.innerText = 'Felder hinzufügen';
		addButton.style.marginTop = '10px';
		addButton.onclick = () => addFormField(container, minX, maxX, minY, maxY);
		container.appendChild(addButton);

		// Schaltfläche zum Exportieren der JSON-Datei
		const exportButton = document.createElement('button');
		exportButton.innerText = 'Export JSON';
		exportButton.style.marginTop = '10px';
		exportButton.style.marginLeft = '10px';
		exportButton.onclick = exportJson;
		container.appendChild(exportButton);

		// Formular-Div an das Dokument anhängen, unterhalb von #puzzle_grid
		const puzzleGrid = document.getElementById('puzzle_grid');
		puzzleGrid.insertAdjacentElement('afterend', container);
	}

	// Funktion zum Hinzufügen eines neuen Formularfelds
	function addFormField(container, minX, maxX, minY, maxY) {
		const formGroup = document.createElement('div');
		formGroup.style.marginBottom = '10px';

		const xLabel = document.createElement('label');
		xLabel.innerText = 'X: ';
		xLabel.style.marginRight = '5px';

		const xInput = document.createElement('input');
		xInput.type = 'number';
		xInput.placeholder = 'X';
		xInput.min = minX;
		xInput.max = maxX;
		xInput.style.marginRight = '5px';
		xInput.oninput = () => updateLetterDisplay(formGroup, xInput, yInput);

		const yLabel = document.createElement('label');
		yLabel.innerText = 'Y: ';
		yLabel.style.marginLeft = '10px';
		yLabel.style.marginRight = '5px';

		const yInput = document.createElement('input');
		yInput.type = 'number';
		yInput.placeholder = 'Y';
		yInput.min = minY;
		yInput.max = maxY;
		yInput.oninput = () => updateLetterDisplay(formGroup, xInput, yInput);

		const letterDisplay = document.createElement('div');
		letterDisplay.style.marginTop = '5px';
		letterDisplay.style.fontStyle = 'italic';

		formGroup.appendChild(xLabel);
		formGroup.appendChild(xInput);
		formGroup.appendChild(yLabel);
		formGroup.appendChild(yInput);
		formGroup.appendChild(letterDisplay);

		container.insertBefore(formGroup, container.querySelector('button'));
	}

	// Funktion zur Aktualisierung der Buchstabenanzeige
	function updateLetterDisplay(formGroup, xInput, yInput) {
		const x = parseInt(xInput.value, 10);
		const y = parseInt(yInput.value, 10);
		const letterDisplay = formGroup.querySelector('div');

		if (!isNaN(x) && !isNaN(y)) {
			const cell = document.querySelector(`#puzzle_cell${x}-${y} .cell_char`);
			if (cell) {
				const letter = cell.textContent.trim() || '-';
				letterDisplay.innerText = `Buchstabe: ${letter}`;
			} else {
				letterDisplay.innerText = 'Ungültige Koordinaten';
			}
		} else {
			letterDisplay.innerText = '';
		}
	}

	// Funktion zur Aktualisierung des Lösungswortes
	function updateSolutionWordAndLetters() {
		const container = document.getElementById('dynamicFormContainer');
		const formGroups = container.querySelectorAll('div');
		solutionWord = '';
		finalWordLetters = [];

		formGroups.forEach(group => {
			const inputs = group.querySelectorAll('input');
			if (inputs.length === 2) {
				const x = parseInt(inputs[0].value, 10);
				const y = parseInt(inputs[1].value, 10);
				if (!isNaN(x) && !isNaN(y)) {
					const cell = document.querySelector(`#puzzle_cell${x}-${y} .cell_char`);
					if (cell) {
						const letter = cell.textContent.trim();
						solutionWord += letter;
						finalWordLetters.push({letter, x, y});
					}
				}
			}
		});
	}

	// Funktion zur Aktualisierung der Anzeige des Lösungswortes
	function updateSolutionWordDisplay(displayElement) {
		displayElement.innerText = `Lösungswort: ${solutionWord}`;
	}

	// Funktion zum Erstellen der finalen JSON-Daten
	function createFinalJson() {
		return {
			horizontal: horizontalPoints,
			vertical: verticalPoints,
			finalWord: {
				word: solutionWord,
				letters: finalWordLetters.map(item => {
					const {word, letterPos} = findWordAndPosition(item.x, item.y);
					return {word, letterPos: letterPos + 1}; // +1 für die richtige Position
				})
			}
		};
	}

	// Funktion zum Finden des Wortes und der Position eines Buchstabens
	function findWordAndPosition(x, y) {
		const horizontalMatch = horizontalPoints.find(point => {
			const index = point.word.split('').findIndex((_, idx) => idx + point.startPoint.x === x && point.startPoint.y === y);
			return index !== -1;
		});
		if (horizontalMatch) {
			const letterPos = x - horizontalMatch.startPoint.x;
			return {word: horizontalMatch.word, letterPos};
		}

		const verticalMatch = verticalPoints.find(point => {
			const index = point.word.split('').findIndex((_, idx) => idx + point.startPoint.y === y && point.startPoint.x === x);
			return index !== -1;
		});
		if (verticalMatch) {
			const letterPos = y - verticalMatch.startPoint.y;
			return {word: verticalMatch.word, letterPos};
		}

		return {word: '', letterPos: -1};
	}

	// Funktion zum Erstellen und Herunterladen der JSON-Datei
	function downloadJSON(data, filename) {
		const jsonStr = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonStr], {type: "application/json"});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Validierungsfunktion
	function validateData() {
		if (horizontalPoints.length < 1) {
			alert('Es muss mindestens ein horizontaler Eintrag vorhanden sein.');
			return false;
		}
		if (verticalPoints.length < 1) {
			alert('Es muss mindestens ein vertikaler Eintrag vorhanden sein.');
			return false;
		}
		if (solutionWord.length < 2) {
			alert('Das Lösungswort muss mindestens 2 Zeichen lang sein.');
			return false;
		}
		const uniqueCoords = new Set(finalWordLetters.map(item => `${item.x}-${item.y}`));
		if (uniqueCoords.size !== finalWordLetters.length) {
			alert('Doppelte Koordinaten für das Lösungswort sind nicht erlaubt.');
			return false;
		}
		return true;
	}

	// Exportfunktion
	function exportJson() {
		updateSolutionWordAndLetters();
		const wordDisplay = document.getElementById('wordDisplay');
		updateSolutionWordDisplay(wordDisplay);
		if (!validateData()) {
			return;
		}
		const finalData = createFinalJson();
		downloadJSON(finalData, "crossword_data.json");
	}

	// Deine ursprüngliche Funktion zum Abrufen der Hinweise
	function getClueData(clueHolderId) {
		const descriptions = document.getElementById(clueHolderId).children[1].children;
		const descriptionsArray = Array.from(descriptions);
		const data = [];

		descriptionsArray.forEach((div) => {
			const id = div.children[0].innerHTML;
			const description = div.children[1].value;

			if (description !== "") {
				data.push({id, description});
			}
		});

		return data;
	}

	const horizontalData = getClueData('across_clue_holder');
	const verticalData = getClueData('down_clue_holder');

	// Funktion zur Identifizierung, ob ein Wort horizontal oder vertikal ist
	function findClue(id, clues) {
		return clues.find(clue => clue.id === id);
	}

	// Erweiterter Code zum Sammeln der Startpunkte und Wörter
	let horizontalPoints = [];
	let verticalPoints = [];

	// Get all rows and columns
	let rows = document.querySelectorAll('.puzzle_row');
	let numRows = rows.length;
	let numCols = rows[0].querySelectorAll('.puzzle_cell').length;

	// Dynamische min und max Werte festlegen
	const minX = 1;
	const maxX = numCols;
	const minY = 1;
	const maxY = numRows;

	// Function to get word horizontally from a start point
	function getHorizontalWord(startX, startY) {
		let word = '';
		for (let x = startX; x <= numCols; x++) {
			let cell = document.querySelector(`#puzzle_cell${x}-${startY} .cell_char`);
			if (cell && cell.textContent.trim() !== '') {
				word += cell.textContent.trim();
			} else {
				break;
			}
		}
		return word;
	}

	// Function to get word vertically from a start point
	function getVerticalWord(startX, startY) {
		let word = '';
		for (let y = startY; y <= numRows; y++) {
			let cell = document.querySelector(`#puzzle_cell${startX}-${y} .cell_char`);
			if (cell && cell.textContent.trim() !== '') {
				word += cell.textContent.trim();
			} else {
				break;
			}
		}
		return word;
	}

	// Collect start points and words
	document.querySelectorAll('.cell_number').forEach(cell => {
		if (cell.textContent.trim() !== '') {
			let x = parseInt(cell.getAttribute('data-x'), 10);
			let y = parseInt(cell.getAttribute('data-y'), 10);
			let id = cell.textContent.trim();
			let horizontalWord = getHorizontalWord(x, y);
			let verticalWord = getVerticalWord(x, y);

			let clueHorizontal = findClue(id, horizontalData);
			let clueVertical = findClue(id, verticalData);

			if (clueHorizontal) {
				horizontalPoints.push({
					startPoint: {x: x, y: y},
					word: horizontalWord,
					description: clueHorizontal.description
				});
			}

			if (clueVertical) {
				verticalPoints.push({
					startPoint: {x: x, y: y},
					word: verticalWord,
					description: clueVertical.description
				});
			}
		}
	});

	// Formular erstellen
	createDynamicForm(minX, maxX, minY, maxY);

	// Exportfunktion global verfügbar machen
	window.exportJson = exportJson;
})();
