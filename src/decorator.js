import { CompositeDecorator } from 'draft-js';

import CustomLink from './Components/CustomLink';
import VariableComponent from './Components/VariableComponent';
import { ENTITY_TYPES } from './constants';

const findEntities = type => (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(character => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === type;
    }, callback);
};

export default new CompositeDecorator([
    {
        strategy: findEntities(ENTITY_TYPES.LINK),
        component: CustomLink
    },
    {
        strategy: findEntities(ENTITY_TYPES.VARIABLE),
        component: VariableComponent
    }
]);
