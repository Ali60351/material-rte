import { CompositeDecorator, ContentBlock, ContentState } from 'draft-js';

import CustomLink from './Components/CustomLink';
import VariableComponent from './Components/VariableComponent';
import { ENTITY_TYPES } from './constants';

const findEntities = (type: string) => (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
) => {
    contentBlock.findEntityRanges(character => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === type;
    }, callback);
};

export default new CompositeDecorator([
    {
        strategy: findEntities(ENTITY_TYPES.LINK),
        component: CustomLink,
    },
    {
        strategy: findEntities(ENTITY_TYPES.VARIABLE),
        component: VariableComponent,
    },
]);
