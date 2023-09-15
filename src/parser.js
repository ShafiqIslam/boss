const parseOperator = (line) => {
  return {
    type: "BINARY_OPERATION_STATEMENT",
    op: line[0].value,
    lhs: line[2].type == "BY_KEYWORD" ? line[1].value : line[3].value,
    rhs: line[2].type == "BY_KEYWORD" ? line[3] : line[1],
  };
};

const parseConditionalOperator = (line) => {
  return {
    type: "BINARY_OPERATION_STATEMENT",
    op: line[4].value,
    lhs: line[1],
    rhs: line[2],
  };
};

const parseInnerBody = (tokensOfBody, i, firstLine) => {
  let endToken = firstLine[0].type === "IF_KEYWORD" ? "ENDIF_KEYWORD" : "ENDLOOP_KEYWORD";

  let body = [];
  while (tokensOfBody[++i][0].type != endToken) {
    body.push(tokensOfBody[i]);
  }
  return [
    {
      type: firstLine[0].type === "IF_KEYWORD" ? "IF_STATEMENT" : "LOOP_STATEMENT",
      lhs: parseConditionalOperator(firstLine),
      rhs: convertStatements(body),
    },
    i,
  ];
};

const convertStatements = (tokensOfBody) => {
  let statements = [];
  for (let i = 0; i < tokensOfBody.length; i++) {
    let line = tokensOfBody[i];
    if (line[0].type === "SET_KEYWORD") {
      // check syntax
      statements.push({ type: "ASSIGN_STATEMENT", lhs: line[3].value, rhs: line[1] });
    } else if (line[0].type === "OPERATOR") {
      statements.push(parseOperator(line));
    } else if (line[0].type === "PRINT_KEYWORD") {
      statements.push({ type: "PRINT_STATEMENT", lhs: line[1] });
    } else if (line[0].type === "SCAN_KEYWORD") {
      statements.push({ type: "SCAN_STATEMENT", lhs: line[1].value });
    } else if (line[0].type === "IF_KEYWORD" || line[0].type === "LOOP_KEYWORD") {
      [s, i] = parseInnerBody(tokensOfBody, i, line);
      statements.push(s);
    } else if (line[0].type === "RETURN_KEYWORD") {
      statements.push({ type: "RETURN_STATEMENT" });
    }
  }
  return statements;
};

const parser = (tokens) => {
  return {
    type: "Program",
    statements: convertStatements(tokens),
  };
};

module.exports = { parser };
