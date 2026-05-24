import React, { useState } from "react";

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [resetDisplayOnNextKey, setResetDisplayOnNextKey] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === "0" || resetDisplayOnNextKey) {
      setDisplay(digit);
      setResetDisplayOnNextKey(false);
    } else {
      if (display.length < 10) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (resetDisplayOnNextKey) {
      setDisplay("0.");
      setResetDisplayOnNextKey(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setCurrentValue(null);
    setActiveOperator(null);
    setResetDisplayOnNextKey(false);
  };

  const handleToggleSign = () => {
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setDisplay(String(num * -1));
    }
  };

  const handlePercent = () => {
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setDisplay(String(num / 100));
    }
  };

  const calculate = (first: number, second: number, op: string): number => {
    switch (op) {
      case "÷":
        return second !== 0 ? first / second : 0;
      case "×":
        return first * second;
      case "−":
        return first - second;
      case "+":
        return first + second;
      default:
        return second;
    }
  };

  const handleOperator = (op: string) => {
    const num = parseFloat(display);
    if (activeOperator && currentValue !== null && !resetDisplayOnNextKey) {
      const result = calculate(currentValue, num, activeOperator);
      setCurrentValue(result);
      setDisplay(String(result));
    } else {
      setCurrentValue(num);
    }
    setActiveOperator(op);
    setResetDisplayOnNextKey(true);
  };

  const handleEquals = () => {
    if (!activeOperator || currentValue === null) return;
    const num = parseFloat(display);
    const result = calculate(currentValue, num, activeOperator);
    setDisplay(String(result));
    setCurrentValue(null);
    setActiveOperator(null);
    setResetDisplayOnNextKey(true);
  };

  return (
    <div id="calculator-app" className="w-full h-full bg-[#1e1e1e] text-white flex flex-col justify-end p-4 rounded-b-xl max-w-sm mx-auto select-none">
      {/* Dynamic Display Panel */}
      <div className="text-right text-4.5xl font-light pr-2 pb-3 overflow-hidden text-ellipsis whitespace-nowrap tracking-wide select-text">
        {display}
      </div>

      {/* Grid Layout of Keys */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          id="calc-clear"
          className="aspect-square rounded-full bg-[#a5a5a5] text-black hover:bg-[#d4d4d4] transition text-sm font-medium focus:outline-none active:scale-95 duration-100"
        >
          {display === "0" && currentValue === null ? "AC" : "C"}
        </button>
        <button
          onClick={handleToggleSign}
          id="calc-negate"
          className="aspect-square rounded-full bg-[#a5a5a5] text-black hover:bg-[#d4d4d4] transition text-sm font-medium focus:outline-none active:scale-95 duration-100"
        >
          +/-
        </button>
        <button
          onClick={handlePercent}
          id="calc-percentage"
          className="aspect-square rounded-full bg-[#a5a5a5] text-black hover:bg-[#d4d4d4] transition text-sm font-medium focus:outline-none active:scale-95 duration-100"
        >
          %
        </button>
        <button
          onClick={() => handleOperator("÷")}
          id="calc-div"
          className={`aspect-square rounded-full text-lg font-medium focus:outline-none active:scale-95 duration-100 transition ${
            activeOperator === "÷" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white hover:bg-[#f3b552]"
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit("7")}
          id="calc-num-7"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          7
        </button>
        <button
          onClick={() => handleDigit("8")}
          id="calc-num-8"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          8
        </button>
        <button
          onClick={() => handleDigit("9")}
          id="calc-num-9"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          9
        </button>
        <button
          onClick={() => handleOperator("×")}
          id="calc-multiply"
          className={`aspect-square rounded-full text-lg font-medium focus:outline-none active:scale-95 duration-100 transition ${
            activeOperator === "×" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white hover:bg-[#f3b552]"
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit("4")}
          id="calc-num-4"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          4
        </button>
        <button
          onClick={() => handleDigit("5")}
          id="calc-num-5"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          5
        </button>
        <button
          onClick={() => handleDigit("6")}
          id="calc-num-6"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          6
        </button>
        <button
          onClick={() => handleOperator("−")}
          id="calc-subtract"
          className={`aspect-square rounded-full text-lg font-medium focus:outline-none active:scale-95 duration-100 transition ${
            activeOperator === "−" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white hover:bg-[#f3b552]"
          }`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit("1")}
          id="calc-num-1"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          1
        </button>
        <button
          onClick={() => handleDigit("2")}
          id="calc-num-2"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          2
        </button>
        <button
          onClick={() => handleDigit("3")}
          id="calc-num-3"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          3
        </button>
        <button
          onClick={() => handleOperator("+")}
          id="calc-add"
          className={`aspect-square rounded-full text-lg font-medium focus:outline-none active:scale-95 duration-100 transition ${
            activeOperator === "+" ? "bg-white text-[#ff9f0a]" : "bg-[#ff9f0a] text-white hover:bg-[#f3b552]"
          }`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit("0")}
          id="calc-num-0"
          className="col-span-2 h-[60px] rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal text-left pl-6 focus:outline-none active:scale-95 duration-100"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          id="calc-decimal"
          className="aspect-square rounded-full bg-[#333333] text-white hover:bg-[#555555] transition text-lg font-normal focus:outline-none active:scale-95 duration-100"
        >
          ,
        </button>
        <button
          onClick={handleEquals}
          id="calc-equals"
          className="aspect-square rounded-full bg-[#ff9f0a] text-white hover:bg-[#f3b552] transition text-lg font-medium focus:outline-none active:scale-95 duration-100"
        >
          =
        </button>
      </div>
    </div>
  );
}
