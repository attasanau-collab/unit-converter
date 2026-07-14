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
    
    calculate();
}

// ฟังก์ชันคำนวณการแปลงหน่วย
function calculate() {
    const category = categorySelect.value;
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
        
        // แปลงเป็นหน่วยฐาน (Base unit) ก่อน แล้วหารด้วยอัตราส่วนหน่วยปลายทาง
        const valueInBase = value * factorFrom;
        result = valueInBase / factorTo;
    }

    // จัดการจุดทศนิยม ไม่ให้ยาวเกินไป (ตัดศูนย์ที่อยู่ท้ายสุดออก)
    outputValue.value = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
}

// ฟังก์ชันคำนวณอุณหภูมิ (เนื่องจากใช้การบวก/ลบ ไม่ใช่แค่การคูณ)
function convertTemperature(value, from, to) {
    if (from === to) return value;
    
    let celsius;
    
    // แปลงทุกอย่างให้เป็นเซลเซียสก่อน
    if (from === 'celsius') celsius = value;
    else if (from === 'fahrenheit') celsius = (value - 32) * 5/9;
    else if (from === 'kelvin') celsius = value - 273.15;

    // แปลงจากเซลเซียสไปยังหน่วยปลายทาง
    if (to === 'celsius') return celsius;
    else if (to === 'fahrenheit') return (celsius * 9/5) + 32;
    else if (to === 'kelvin') return celsius + 273.15;
}

// ตั้งค่า Event Listeners เพื่อให้ระบบคำนวณอัตโนมัติเมื่อมีการเปลี่ยนแปลงค่า
categorySelect.addEventListener('change', populateUnits);
unitFromSelect.addEventListener('change', calculate);
unitToSelect.addEventListener('change', calculate);
inputValue.addEventListener('input', calculate);

// เริ่มต้นการทำงานครั้งแรก
populateUnits();

const swapBtn = document.getElementById('swapBtn');

swapBtn.addEventListener('click', () => {
    // สลับค่าใน Select ทั้งสองตัว
    const temp = unitFromSelect.value;
    unitFromSelect.value = unitToSelect.value;
    unitToSelect.value = temp;
    
    // คำนวณผลลัพธ์ใหม่ทันที
    calculate();
});