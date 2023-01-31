export function sortList(list: array, column: string, order: number = 1) {
  return list.sort(function (a, b) {
    const columnA = column ? a[column] : a;
    const columnB = column ? b[column] : b;

    if (typeof columnA === "string") {
      return columnA.trim().toLowerCase() > columnB.trim().toLowerCase()
        ? order
        : -order;
    } else {
      return columnA > columnB ? order : -order;
    }
  });
}
