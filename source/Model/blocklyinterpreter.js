/**
 * Created by Sam on 31/01/2017.
 */
var workspace, RuleEditor = {
    blocklyArea: null,
    blocklyDiv: null,
    init: function () {
        RuleEditor.blocklyArea = document.getElementById('blockly_area');
        RuleEditor.blocklyDiv = document.getElementById('blockly_div');
        workspace = Blockly.inject(RuleEditor.blocklyDiv,
            {toolbox: document.getElementById('toolbox'),});
        window.addEventListener('resize', RuleEditor.onresize, false);
        $('#rules_modal').on('resize', RuleEditor.onresize);
        $('#blockly_area').on('resize', RuleEditor.onresize);
        $('#blockly_div').on('resize', RuleEditor.onresize);
        RuleEditor.onresize();
        Blockly.svgResize(workspace);
    },
    onresize: function (e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = RuleEditor.blocklyArea;
        var x = 0;
        var y = 0;
        // do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        // } while (element);
        // Position blocklyDiv over blocklyArea.
        RuleEditor.blocklyDiv.style.left = x + 'px';
        RuleEditor.blocklyDiv.style.top = y + 'px';
        RuleEditor.blocklyDiv.style.width = RuleEditor.blocklyArea.offsetWidth + 'px';
        RuleEditor.blocklyDiv.style.height = RuleEditor.blocklyArea.offsetHeight + 'px';
        Blockly.svgResize(workspace);
    }
};