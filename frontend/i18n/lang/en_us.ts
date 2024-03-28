import { Rover } from '../en_us/Rover';
import { Planet } from '../en_us/Planet';
import { Home } from '../en_us/Home';
import { Browser } from '../en_us/Browser';
import { Other } from '../en_us/Other';

import plugin from './en_us/plugin.yml';

export default {
    ...Rover,
    ...Planet,
    ...{ plugin: { ...plugin } },
    ...Home,
    ...Browser,
    ...Other,
};
