import Transak from '@biconomy/transak';
import styles from "../styles/Menu.module.css"

type Props = {
  address: string
  userInfo: any
}
const Onboarder: React.FC<Props> = ({ address, userInfo }) => {
  // use this info for transak package
const transak = new Transak('PRODUCTION', {
  walletAddress: address,
  userData: {
    firstName: userInfo?.name || '',
    email: userInfo?.email || '',
  },
});
return(
  <div className={styles.logoutButtonWrapper}>
    <button className={styles.logoutButon}  onClick={() => transak.init()}>Buy USDC on Polygon</button>
      </div>
)
}

export default Onboarder;
