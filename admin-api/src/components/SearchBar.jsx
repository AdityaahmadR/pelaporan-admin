// components/SearchBar.jsx
import Image from 'next/image';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <Image
          src="/Search.png"
          alt="Search"
          width={20}
          height={20}
          className={styles.searchIcon}
        />
        <input
          type="text"
          placeholder="Search"
          className={styles.searchInput}
        />
      </div>
      <button className={styles.uploadButton}>
        <Image
          src="/Upload.png"
          alt="Upload"
          width={20}
          height={20}
        />
        <span>Upload</span>
      </button>
    </div>
  );
}