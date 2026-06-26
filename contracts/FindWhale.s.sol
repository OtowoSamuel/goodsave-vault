pragma solidity ^0.8.24;
import "forge-std/Script.sol";
interface IERC20 { function balanceOf(address) external view returns (uint256); }
contract FindWhale is Script {
    function run() external {
        address token = 0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A;
        address[] memory candidates = new address[](3);
        candidates[0] = 0x43d72Ff17701B2DA814620735C39C620Ce0ea4A1;
        candidates[1] = 0x7888612486844Bb9BE598668081c59A9f7367FBc;
        candidates[2] = 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B;
        for(uint i=0; i<candidates.length; i++) {
            try IERC20(token).balanceOf(candidates[i]) returns (uint256 bal) {
                console.log(candidates[i], bal);
            } catch {}
        }
    }
}
