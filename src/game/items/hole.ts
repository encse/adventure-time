import { makeItem } from "./items";

export const hole =  makeItem({
    name: 'hole',
    access: 'not found',
    examine: () => `A third stick would fit perfectly there.`
});