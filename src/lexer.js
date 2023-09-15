const keywords = {
  sat: "SET_KEYWORD",
  shera: "PRINT_KEYWORD",
  dhor: "SCAN_KEYWORD",
  to: "TO_KEYWORD",
  from: "FROM_KEYWORD",
  by: "BY_KEYWORD",
  er: "CONDITION_KEYWORD",
  oyoy: "IF_KEYWORD",
  gura: "LOOP_KEYWORD",
  shyash: "RETURN_KEYWORD",
  oyoy: "IF_KEYWORD",
  oyoyshyash: "ENDIF_KEYWORD",
  gura: "LOOP_KEYWORD",
  gurashyash: "ENDLOOP_KEYWORD",
};

const operators = {
  jug: "add",
  biyug: "sub",
  gun: "mul",
  vag: "udiv",
  vagshyash: "urem",
  soman: "icmp eq",
  sudo: "icmp ult",
  boro: "icmp ugt",
};

const formatToken = (token) => {
  if (token.trim() == "") {
    return null;
  } else if (keywords.hasOwnProperty(token)) {
    return { type: keywords[token] };
  } else if (operators.hasOwnProperty(token)) {
    return { type: "OPERATOR", value: operators[token] };
  } else if (isNaN(token)) {
    return { type: "VARIABLE", value: token };
  } else if (!isNaN(token)) {
    return { type: "NUMBER_LITERAL", value: parseInt(token) };
  }

  // unknown token
};

const lexer = (sourceCode) => {
  return sourceCode
    .split("\n")
    .map((line) => {
      if (line.trim() == "") return null;

      return line
        .split(" ")
        .map(formatToken)
        .filter((e) => e != null);
    })
    .filter((e) => e != null);
};

module.exports = { lexer };
