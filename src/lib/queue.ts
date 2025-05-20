import PQueue from 'p-queue';
import { getSecret } from 'astro:env/server';

const concurrency = parseInt(getSecret('QUEUE_CONCURRENCY') || '1', 10);
const queue = new PQueue({ concurrency });

export default queue;
