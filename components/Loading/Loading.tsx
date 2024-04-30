import { Loader } from '@mantine/core';
import styles from './Loading.module.css';

export default function Loading(props) {
  return (
    <div className={styles.loading}>
      <Loader size={40} />
      <div>{props.loadingText != '' ? props.loadingText : 'Loading..'}</div>
    </div>
  );
}
