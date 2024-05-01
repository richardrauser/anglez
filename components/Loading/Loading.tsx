import { Loader } from '@mantine/core';
import styles from './Loading.module.css';

export default function Loading(props: { loadingText?: string }) {
  return (
    <div className={styles.loading}>
      <Loader size={40} />
      <div>{props.loadingText != '' ? props.loadingText : 'Loading..'}</div>
    </div>
  );
}
