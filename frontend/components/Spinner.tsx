import styles from "../styles/Spinner.module.css"

// really cool css spinner from https://loading.io/css/
const Spinner = () => {
  return( 
    <div className={styles.spinner}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  )
}

export default Spinner;