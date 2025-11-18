import ModelIOPanelView from './ModelIOPanelView';
import { useModelStore } from '../state/store';

const ModelIOPanel = (): JSX.Element => {
  const { model, loadModel } = useModelStore((state) => ({
    model: state.model,
    loadModel: state.loadModel,
  }));

  return <ModelIOPanelView model={model} onImportModel={loadModel} />;
};

export default ModelIOPanel;
