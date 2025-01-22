import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';

import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'diagram-js-minimap/assets/diagram-js-minimap.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

import './style.css';

import './svg/download.svg';
import './svg/image.svg';
import './svg/quit.svg';
import './svg/save.svg';

import $ from 'jquery';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import resizeTask from 'bpmn-js-task-resize/lib';
import minimapModule from 'diagram-js-minimap';
import diagramXML from '../resources/newDiagram.bpmn';
import BpmnColorPickerModule from 'bpmn-js-color-picker';

import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';

var container = $('#js-drop-zone');

var modeler = new BpmnModeler({
  container: '#js-canvas',
  keyboard: {
    bindTo: window
  },
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    minimapModule, BpmnColorPickerModule, BpmnPropertiesPanelModule, BpmnPropertiesProviderModule, resizeTask
  ],
  taskResizingEnabled: true
});

function createNewDiagram() {
  if ((typeof textdiagramXML == "string") && (textdiagramXML))
    openDiagram(textdiagramXML);
  else
    openDiagram(diagramXML);
}

async function openDiagram(diagramData) {

  container
    .removeClass('with-error')
    .addClass('with-diagram');

  modeler
    .importXML(diagramData)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.log(warnings);
      } 
      const canvas = modeler.get("canvas");
      canvas.zoom("fit-viewport");
    })
    .catch((err) => {
      container
        .removeClass('with-diagram')
        .addClass('with-error');
      container.find('.error pre').text(err.message);
      console.error(err);
    });

}

function registerFileDrop(container, callbackOpenDiagram) {

  if (!window.FileList || !window.FileReader) {
    window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using Chrome, Firefox or the Internet Explorer > 10.');
    return;
  }

  function handleFileSelect(elm) {
    elm.stopPropagation();
    elm.preventDefault();

    var file = elm.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function(elm) {
      var xml = elm.target.result;
      callbackOpenDiagram(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(elm) {
    elm.stopPropagation();
    elm.preventDefault();

    elm.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver,   false);
  container.get(0).addEventListener('drop',     handleFileSelect, false);
}

// file drag / drop ///////////////////////
registerFileDrop(container, openDiagram);

// bootstrap diagram functions
$(function() {

  if (!!document.getElementById('#js-load-diagram')) {
    createNewDiagram();
  };

  $('#js-create-diagram').click(function(elm) {
    elm.stopPropagation();
    elm.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(elm) {
    if (!$(this).is('.active')) {
      elm.preventDefault();
      elm.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {

    if (!existLink(link)) {
      return
    }

    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  function existLink(link) {
    return (typeof link !== 'undefined' && link.length > 0)
  }

  var exportArtifacts = debounce(async function() {

    try {
      if (existLink(downloadSvgLink)) {
        const { svg } = await modeler.saveSVG();
        setEncoded(downloadSvgLink, 'diagram.svg', svg);
      }
    } catch (err) {
      console.error('Error happened saving svg: ', err);
      setEncoded(downloadSvgLink, 'diagram.svg', null);
    }

    try {
      const { xml } = await modeler.saveXML({ format: true });
      if (existLink(downloadLink)) {
        setEncoded(downloadLink, 'diagram.bpmn', xml);
      }
      if ((typeof textdiagramXML === "string")) {
        textdiagramXML = xml
      }
    } catch (err) {
      console.error('Error happened saving XML: ', err);
      setEncoded(downloadLink, 'diagram.bpmn', null);
    }

  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});

// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}