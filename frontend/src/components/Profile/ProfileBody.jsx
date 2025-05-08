import { Pencil, KeyRound, UserPen, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileBody = () => {
  return (
    <div className="p-4">
      <Link to="/Orders" className="text-blue-500 hover:underline">
        My Order
      </Link>
    </div>
  );
};

export default ProfileBody;
