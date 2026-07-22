// ข้อมูลหน่วยและอัตราส่วน (อ้างอิงจากหน่วยฐาน เช่น เมตร, กิโลกรัม)
const units = {
    length: {
        meter: { name: 'เมตร', factor: 1 },
        kilometer: { name: 'กิโลเมตร', factor: 1000 },
        centimeter: { name: 'เซนติเมตร', factor: 0.01 },
        millimeter: { name: 'มิลลิเมตร', factor: 0.001 },
        mile: { name: 'ไมล์', factor: 1609.34 },
        yard: { name: 'หลา', factor: 0.9144 },
        foot: { name: 'ฟุต', factor: 0.3048 },
        inch: { name: 'นิ้ว', factor: 0.0254 }
    },
    weight: {
        kilogram: { name: 'กิโลกรัม', factor: 1 },
        gram: { name: 'กรัม', factor: 0.001 },
        milligram: { name: 'มิลลิกรัม', factor: 0.000001 },
        pound: { name: 'ปอนด์', factor: 0.453592 },
        ounce: { name: 'ออนซ์', factor: 0.0283495 }
    },
    temperature: {
        celsius: { name: 'เซลเซียส (°C)' },
        fahrenheit: { name: 'ฟาเรนไฮต์ (°F)' },
        kelvin: { name: 'เคลวิน (K)' }
    },

    data: {
        bit: { name: 'บิต (Bit)', factor: 0.125 },
        byte: { name: 'ไบต์ (B)', factor: 1 },
        kilobyte: { name: 'กิโลไบต์ (KB)', factor: 1024 },
        megabyte: { name: 'เมกะไบต์ (MB)', factor: 1048576 },
        gigabyte: { name: 'กิกะไบต์ (GB)', factor: 1073741824 },
        terabyte: { name: 'เทราไบต์ (TB)', factor: 1099511627776 },
        petabyte: { name: 'เพตาไบต์ (PB)', factor: 1125899906842624 }
    }
};

const categorySelect = document.getElementById('category');
const unitFromSelect = document.getElementById('unitFrom');
const unitToSelect = document.getElementById('unitTo');
const inputValue = document.getElementById('inputValue');
const outputValue = document.getElementById('outputValue');

// ฟังก์ชันอัปเดตตัวเลือกหน่วย เมื่อเปลี่ยนหมวดหมู่
function populateUnits() {
    const category = categorySelect.value;
    const currentUnits = units[category];
    
    // ล้างตัวเลือกเก่า
    unitFromSelect.innerHTML = '';
    unitToSelect.innerHTML = '';

    // ใส่ตัวเลือกใหม่
    for (const [key, data] of Object.entries(currentUnits)) {
        unitFromSelect.add(new Option(data.name, key));
        unitToSelect.add(new Option(data.name, key));
    }
    
    // ตั้งค่าเริ่มต้นให้หน่วยเริ่มต้นกับหน่วยปลายทางไม่ซ้ำกัน
    if (unitToSelect.options.length > 1) {
        unitToSelect.selectedIndex = 1;
    }
    
    calculate(false); // เริ่มต้นหน้าเว็บใหม่ยังไม่ต้องบันทึกประวัติ
}

// ฟังก์ชันคำนวณการแปลงหน่วย
function calculate(saveHistory = false) {
    const category = categorySelect.value;

    // ดักจับไม่ให้กรอกค่าติดลบ สำหรับความยาวและน้ำหนัก
    if (category !== 'temperature' && parseFloat(inputValue.value) < 0) {
        inputValue.value = 0;
    }

    const from = unitFromSelect.value;
    const to = unitToSelect.value;
    const value = parseFloat(inputValue.value);

    // ตรวจสอบว่าผู้ใช้กรอกตัวเลขหรือไม่
    if (isNaN(value)) {
        outputValue.value = '';
        return;
    }

    let result = 0;

    if (category === 'temperature') {
        result = convertTemperature(value, from, to);
    } else {
        // สำหรับความยาวและน้ำหนัก
        const factorFrom = units[category][from].factor;
        const factorTo = units[category][to].factor;
        
        const valueInBase = value * factorFrom;
        result = valueInBase / factorTo;
    }

    // จัดการจุดทศนิยม
    // จัดการจุดทศนิยมอย่างเหมาะสม
    let finalResult;
    if (Number.isInteger(result)) {
        finalResult = result;
    } else if (Math.abs(result) < 0.000001 && result !== 0) {
        finalResult = parseFloat(result.toPrecision(6)); // ช่วยเก็บความแม่นยำเวลาแปลงจาก B ไป TB/PB
    } else {
        finalResult = parseFloat(result.toFixed(6));
    }

    outputValue.value = finalResult;

    // บันทึกประวัติเฉพาะเมื่อตั้งค่าให้เซฟเท่านั้น
    if (saveHistory) {
        saveToHistory(value, from, finalResult, to);
    }
}

// ฟังก์ชันคำนวณอุณหภูมิ
function convertTemperature(value, from, to) {
    if (from === to) return value;
    
    let celsius;
    
    if (from === 'celsius') celsius = value;
    else if (from === 'fahrenheit') celsius = (value - 32) * 5/9;
    else if (from === 'kelvin') celsius = value - 273.15;

    if (to === 'celsius') return celsius;
    else if (to === 'fahrenheit') return (celsius * 9/5) + 32;
    else if (to === 'kelvin') return celsius + 273.15;
}

// ฟังก์ชันบันทึกประวัติ
function saveToHistory(valIn, unitIn, valOut, unitOut) {
    if (valIn === undefined || isNaN(valIn)) return;
    
    let history = JSON.parse(localStorage.getItem('unit_converter_history')) || [];
    const textIn = units[categorySelect.value][unitIn].name;
    const textTo = units[categorySelect.value][unitOut].name;
    const record = `${valIn} ${textIn} ➡️ ${valOut} ${textTo}`;

    if (history[0] === record) return;

    history.unshift(record);
    if (history.length > 5) history.pop();

    localStorage.setItem('unit_converter_history', JSON.stringify(history));
    renderHistory();
}

// ฟังก์ชันเรนเดอร์รายการประวัติบนหน้าเว็บ
function renderHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    const history = JSON.parse(localStorage.getItem('unit_converter_history')) || [];
    
    historyList.innerHTML = history.length === 0 
        ? '<li style="background:none; justify-content:center;">ไม่มีประวัติการคำนวณ</li>' 
        : history.map(item => `<li><span>${item}</span></li>`).join('');
}

/* ========================================================
   แก้ไขส่วนตั้งค่า Event Listeners ให้ถูกต้องและทำงานร่วมกันได้ดี
   ======================================================== */

// 1. เปลี่ยนหมวดหมู่ ให้ล้างหน่วยและคำนวณใหม่ทันที
categorySelect.addEventListener('change', populateUnits);

// 2. เปลี่ยนหน่วยต้นทาง-ปลายทาง ให้คำนวณและบันทึกประวัติทันที
unitFromSelect.addEventListener('change', () => calculate(true));
unitToSelect.addEventListener('change', () => calculate(true));

// 3. ตอนพิมพ์: คำนวณผลลัพธ์แบบเรียลไทม์ (แต่ยังไม่บันทึกประวัติเพื่อไม่ให้รก)
inputValue.addEventListener('input', () => calculate(false));

// 4. ตอนกด Enter: บันทึกประวัติทันที!
inputValue.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        calculate(true);
    }
});

// 5. ตอนคลิกเมาส์ออกนอกกล่อง (Blur): บันทึกประวัติทันที!
inputValue.addEventListener('blur', () => calculate(true));

// ระบบปุ่มสลับหน่วย (Swap)
const swapBtn = document.getElementById('swapBtn');
if (swapBtn) {
    swapBtn.addEventListener('click', () => {
        const temp = unitFromSelect.value;
        unitFromSelect.value = unitToSelect.value;
        unitToSelect.value = temp;
        calculate(true); // สลับหน่วยแล้ว บันทึกประวัติทันที
    });
}

// ระบบปุ่มคัดลอก (Copy)
const copyBtn = document.getElementById('copyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        if (!outputValue.value) return;
        
        navigator.clipboard.writeText(outputValue.value).then(() => {
            copyBtn.innerText = '✅';
            copyBtn.style.backgroundColor = '#dcfce7';
            
            setTimeout(() => {
                copyBtn.innerText = '📋';
                copyBtn.style.backgroundColor = '';
            }, 1200);
        }).catch(err => {
            console.error('ไม่สามารถคัดลอกได้:', err);
        });
    });
}

// ล้างประวัติการคำนวณ
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('unit_converter_history');
        renderHistory();
    });
}

// เริ่มต้นการทำงานครั้งแรกเมื่อเปิดหน้าเว็บ
populateUnits();
renderHistory();