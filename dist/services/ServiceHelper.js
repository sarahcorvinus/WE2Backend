"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToDate = exports.dateToString = void 0;
function dateToString(date) {
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}
exports.dateToString = dateToString;
function stringToDate(dateString) {
    const parts = dateString.split('.');
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}Z`);
}
exports.stringToDate = stringToDate;
//# sourceMappingURL=ServiceHelper.js.map