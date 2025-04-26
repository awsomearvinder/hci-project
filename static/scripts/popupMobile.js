async function setTreeInfo(treeID) {
    const treeNameElement = document.getElementById("tree-name");
    const treeImageElement = document.getElementById("tree-image");
    const treeImageContainer = document.getElementById('tree-image-container');
    
    const treeDataResp = await fetch('/locations/api/entities/' + treeID);
    const treeData = await treeDataResp.text();
    const parser = new DOMParser();
    const treeXML = parser.parseFromString(treeData, "text/xml");
    
    treeImageElement.src = treeXML.getElementsByTagName("DefaultImagePath")[0].textContent;
    treeNameElement.textContent = treeXML.getElementsByTagName("DisplayName")[0].textContent;
    treeImageElement.style.display = 'block';
    treeImageContainer.style.display = 'block';
}
setTreeInfo(1);