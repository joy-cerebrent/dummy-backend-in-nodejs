export default function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
