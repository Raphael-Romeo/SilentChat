function saveSelectionAsMarker() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0).cloneRange();
    const marker = document.createElement('div');
    marker.id = '__selectionMarker';
    marker.style.display = 'none';

    range.insertNode(marker);
    range.setStartAfter(marker);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

function restoreSelectionFromMarker() {
    const marker = document.getElementById('__selectionMarker');
    if (!marker) return;

    const range = document.createRange();
    range.setStartAfter(marker);
    range.collapse(true);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    marker.parentNode.removeChild(marker);
}