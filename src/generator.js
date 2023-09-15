let tempCounter = 0;

let symbolTable = {};

const convertAssign = (targetCode, statement) => {
  if (!symbolTable.hasOwnProperty(statement.lhs)) {
    targetCode += `%${statement.lhs} = alloca i32\n`;
    symbolTable[statement.lhs] = true;
  }

  if (statement.rhs.type == "NUMBER_LITERAL") {
    targetCode += `store i32 ${statement.rhs.value}, i32* %${statement.lhs}\n`;
  } else {
    let t1 = `%T${tempCounter++}`;
    targetCode += `${t1} = load i32, i32* %${statement.rhs.value}\n`;
    targetCode += `store i32 ${t1}, i32* %${statement.lhs}\n`;
  }
  return targetCode;
};

const convertArithmatic = (targetCode, statement) => {
  let val = "";
  if (statement.rhs.type == "NUMBER_LITERAL") {
    val = `${statement.rhs.value}`;
  } else {
    let t0 = `%T${tempCounter++}`;
    targetCode += `${t0} = load i32, i32* %${statement.rhs.value}\n`;
    val = t0;
  }

  let t1 = `%T${tempCounter++}`;
  let t2 = `%T${tempCounter++}`;
  targetCode += `${t1} = load i32, i32* %${statement.lhs}\n`;
  targetCode += `${t2} = ${statement.op} i32 ${t1}, ${val}\n`;
  targetCode += `store i32 ${t2}, i32* %${statement.lhs}\n`;
  return targetCode;
};

const convertPrint = (targetCode, statement) => {
  let printVal = "";
  if (statement.lhs.type == "NUMBER_LITERAL") {
    printVal = `${statement.lhs.value}`;
  } else {
    let r1 = `%R${tempCounter++}`;
    targetCode += `${r1} = load i32, i32* %${statement.lhs.value}\n`;
    printVal = r1;
  }

  targetCode += `call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.str, i64 0, i64 0), i32 ${printVal})\n`;
  return targetCode;
};

const convertScan = (targetCode, statement) => {
  targetCode += `%${statement.lhs} = alloca i32\n`;
  targetCode += `call i32 (i8*, ...) @__isoc99_scanf(i8* getelementptr inbounds ([3 x i8], [3 x i8]* @.str.1, i64 0, i64 0), i32* %${statement.lhs})\n`;
  return targetCode;
};

const convertConditionBrach = (targetCode, conditionBranch) => {
  let t1 = `%T${tempCounter++}`;
  if (conditionBranch.type == "NUMBER_LITERAL") {
    let t2 = `%T${tempCounter++}`;
    targetCode += `${t2} = alloca i32\n`;
    targetCode += `store i32 ${conditionBranch.value}, i32* ${t2}\n`;
    targetCode += `${t1} = load i32, i32* ${t2}\n`;
  } else {
    targetCode += `${t1} = load i32, i32* %${conditionBranch.value}\n`;
  }
  return [targetCode, t1];
};

const convertCondition = (targetCode, conditionExpression) => {
  [targetCode, left] = convertConditionBrach(targetCode, conditionExpression.lhs);
  [targetCode, right] = convertConditionBrach(targetCode, conditionExpression.rhs);

  let c1 = `%C${tempCounter++}`;
  targetCode += `${c1} = ${conditionExpression.op} i32 ${left}, ${right}\n`;
  return [targetCode, c1];
};

const convertIf = (targetCode, statement) => {
  let trueLabel = `btrue${tempCounter++}`;
  let falseLabel = `bfalse${tempCounter++}`;
  let endLabel = `end${tempCounter++}`;

  [targetCode, c1] = convertCondition(targetCode, statement.lhs);
  targetCode += `br i1 ${c1}, label %${trueLabel}, label %${falseLabel}\n`;
  targetCode += `${trueLabel}:\n`;
  targetCode = convertBody(targetCode, statement.rhs);
  targetCode += `br label %${endLabel}\n`;
  targetCode += `${falseLabel}:\n`;
  targetCode += `br label %${endLabel}\n`;
  targetCode += `${endLabel}:\n`;
  return targetCode;
};

const convertLoop = (targetCode, statement) => {
  let loopLabel = `loop${tempCounter++}`;
  let endLabel = `endloop${tempCounter++}`;

  targetCode += `br label %${loopLabel}\n`;
  targetCode += `${loopLabel}:\n`;
  targetCode = convertBody(targetCode, statement.rhs);
  [targetCode, c1] = convertCondition(targetCode, statement.lhs);
  targetCode += `br i1 ${c1}, label %${loopLabel}, label %${endLabel}\n`;
  targetCode += `${endLabel}:\n`;
  return targetCode;
};

const convertBody = (targetCode, statements) => {
  statements.forEach((statement) => {
    if (statement.type === "ASSIGN_STATEMENT") {
      targetCode = convertAssign(targetCode, statement);
    } else if (statement.type === "BINARY_OPERATION_STATEMENT") {
      targetCode = convertArithmatic(targetCode, statement);
    } else if (statement.type === "PRINT_STATEMENT") {
      targetCode = convertPrint(targetCode, statement);
    } else if (statement.type === "SCAN_STATEMENT") {
      targetCode = convertScan(targetCode, statement);
    } else if (statement.type === "RETURN_STATEMENT") {
      targetCode += `ret i32 0\n`;
    } else if (statement.type === "IF_STATEMENT") {
      targetCode = convertIf(targetCode, statement);
    } else if (statement.type === "LOOP_STATEMENT") {
      targetCode = convertLoop(targetCode, statement);
    }
  });

  return targetCode;
};

const generator = (ast) => {
  let targetCode = `@.str = private unnamed_addr constant [4 x i8] c"%d\\0A\\00"\n`;
  targetCode += `@.str.1 = private unnamed_addr constant [3 x i8] c"%d\\00"`;

  targetCode += `define i32 @main() {\n`;

  targetCode = convertBody(targetCode, ast.statements);

  targetCode += `ret i32 0\n`;
  targetCode += `}\n`;
  targetCode += `declare i32 @printf(i8*, ...)\n`;
  targetCode += `declare i32 @__isoc99_scanf(i8*, ...)\n`;

  return targetCode;
};

module.exports = { generator };
