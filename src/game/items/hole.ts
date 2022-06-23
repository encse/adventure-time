import { makeItem } from "./items";

export const hole = makeItem({
    name: 'hole',
    examine: () => `A third stick would fit perfectly there.`
});