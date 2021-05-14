import { mkdirP, rmRF } from '@actions/io';
import { TEST_DATA_DIRECTORY } from './util';

export = async () => {

  await rmRF(TEST_DATA_DIRECTORY);
  await mkdirP(TEST_DATA_DIRECTORY);

};
