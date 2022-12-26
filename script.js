const numberToWords = (num) => { // Function for converting numbers to their word form1
  if (num.length === "") return '';
  if (num === 0) return 'Zero';

  num = num.toLocaleString('en-US').split(',');
  let arr = [];
  if (num.length === 1) return numToString(num[0]).trim();

  for (let i = 0; i < num.length; i++) {
    arr.push(numToString(num[i]));
  }
  arr = arr.reverse();
  const largeNumbers = ['Thousand', 'Million', 'Billion', 'Trillion', 'Quadrillion', 'Quintillion', 'Sextillion', 'Septillion', 'Octillion', 'Nonillion', 'Decillion', 'Undecillion', 'Duodecillion', 'Tredecillion', 'Quattuordecillion', 'Quindecillion', 'Sexdecillion', 'Septendecillion', 'Octodecillion', 'Novemdecillion', 'Vigintillion', 'Unvigintillion', 'Duovigintillion', 'Trevigintillion', 'Quattuorvigintillion', 'Quinvigintillion', 'Sexvigintillion', 'Septvigintillion', 'Octovigintillion', 'Nonvigintillion', 'Trigintillion', 'Untrigintillion', 'Duotrigintill'];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '') continue;
    if (largeNumbers[i - 1] !== undefined) arr[i] += ` ${largeNumbers[i - 1]}`;
  }
  return arr.reverse().filter(x => x.length !== 0).join(' ');
};

const singles = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
}

const tens = {
  10: "Ten",
  20: "Twenty",
  30: "Thirty",
  40: "Forty",
  50: "Fifty",
  60: "Sixty",
  70: "Seventy",
  80: "Eighty",
  90: "Ninety",
}

const special = {
  11: "Eleven",
  12: "Twelve",
  13: "Thirteen",
  14: "Fourteen",
  15: "Fifteen",
  16: "Sixteen",
  17: "Seventeen",
  18: "Eighteen",
  19: "Nineteen",
}

const numToString = (x) => { // Helper function
  let str = "";
  x = parseInt(x);
  let hundred = Math.floor(x / 100);
  let ones = x % 100;

  // Adding hundreds
  if (hundred !== 0) {
    str += singles[hundred] + " Hundred ";
  }

  // Adding tens
  if (ones !== 0) {
    if (ones % 10 === 0) {
      str += tens[ones]
    } else if (ones < 10) {
      str += singles[ones]
    } else if (ones >= 11 && ones <= 19) {
      str += special[ones];
    } else {
      let tensVal = Math.floor(ones / 10) * 10;
      let onesVal = ones % 10;
      str += `${tens[tensVal]}-${singles[onesVal]} `;
    }
  }
  return str.trim();
}

const numberInput = document.getElementById('number');

const input = () => { // Function for sanitizing the input
  let number = document.getElementById('number').value.replace(/[^0-9e.]/g, '').toLowerCase();
  let index = number.indexOf('e');
  if (index !== -1 && index !== number.length - 1) {
    if ((number.match(/e/g) || []).length > 1) {
      number = number.split('');
      for (let i = index + 1; i < number.length; i++) {
        if (number[i] === 'e') delete number[i], i--;
      }
      number = number.join('');
    }
  } else number = number.replace(/e/g, '');
  index = number.indexOf('.');
  if (index !== -1 && index !== number.length - 1) {
    if ((number.match(/\./g) || []).length > 1) {
      number = number.split('');
      for (let i = index + 1; i < number.length; i++) {
        if (number[i] === '.') delete number[i], i--;
      }
      number = number.join('');
    }
  } else number = number.replace(/\./g, '');
  return number.includes('e') ? scientificToNumber(number) : number;
}

const dashes = document.getElementById('dashes');
const output = document.getElementById('output');

/*
  notes:
  - fix floating error with biginteger => try direct conversion from string to biginteger to avoid errors
  - possible solution: https://stackoverflow.com/questions/64148440/biginteger-parsing-scientific-notation-with-an-exponent-larger-than-1000-results

  possible solution found:
  replaced BigInt(+inputValue) with (+inputValue).toLocaleString('fullwide', { useGrouping: false })

  new solution works with scientific notation
  old solution works with standard form

  9.9999999999999999e100 => rounding error when consecutive 9s are used 

  LMAO WTF
  scientific notation not working for some reasons
  testing logging ASAP (im dead tired so not rn - 1:12 AM)
  seems that any number that is greater than 1k that uses scientific notation breaks (most likely an issue with toLocaleString('en-US')

  1.2e2. returns maximum exceeded error statement, which is completely false (wtf)

  random errors with scientific notation - FML I want to die please remember to die
  after it is complete use the new function to clean errors with scientific notation by manually applying scientific notation

  consider adding code for removing extra decimals that is a replica of the code for removing extra "e"/"E"'s
  
*/

const displayResult = () => { // Function for updating the output text
  const inputValue = input();
  console.log(inputValue);
  if (inputValue === 'err') {
    output.innerHTML = `<b style="color:red">An error has occurred. The input provided does not use proper scientific notation.</b>`
  } else if (!Number.isInteger(+inputValue)) {
    output.innerHTML = `<b style="color:red">An error has occurred. The input provided is not a valid integer.</b>`
    return;
  } else if (BigInt(inputValue) >= BigInt(scientificToNumber('1e102'))) {
    output.innerHTML = `<b style="color:red">An error has occurred. The input provided exceeds the maximum supported value.</b>`;
    return;
  }
  const result = BigInt(inputValue);
  if (inputValue === '') output.innerHTML = ``;
  else {
    let outputHTML = `<span class="result">${result.toLocaleString('en-US')}</span><br><hr><br>${numberToWords(result)}`
    outputHTML = !dashes.checked ? outputHTML.replace(/-/g, ' ') : outputHTML;
    output.innerHTML = outputHTML;
  }
}

const scientificToNumber = (num) => { // Function for converting from scientific notation to standard former without accuracy loss
  num = num.split('e');
  if (num.includes('')) return 'err';
  const index = num[0].indexOf('.');
  if (index === -1) {
    return `${num[0]}${'0'.repeat(Number(num[1].replace(/\D/g, '')))}`;
  } else {
    const decimals = num[0].length - 1 - index;
    const eNum = Number(num[1].replace(/\D/g, ''));
    if (eNum === decimals) {
      return num[0].replace(/\D/g, '');
    } else if (eNum > decimals) {
      return `${num[0].replace(/\D/g, '')}${'0'.repeat(eNum - decimals)}`;
    } else {
      return;
    }
  }
}

// Event listeners for automatically updating the output when the text field is updated or when the checkbox is checked or unchecked

numberInput.addEventListener('input', () => {
  displayResult();
});

dashes.addEventListener('change', () => {
  displayResult();
});