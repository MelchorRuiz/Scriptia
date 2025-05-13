import PQueue from 'p-queue';
const queue = new PQueue({ concurrency: 1 });
export default queue;
