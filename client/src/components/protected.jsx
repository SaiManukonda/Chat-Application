import React ,{useState, useEffect} from 'react';
import axios from "axios";

const Protected = () => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const validateSession = async () => {
            try {
                const response = await axios.get('http://localhost:3007/validate');
                if (response.data.valid) {
                    setUserName(response.data.userName);
                } else {
                    // Handle invalid session, e.g., redirect to login
                }
            } catch (error) {
                console.error('Error validating session', error);
                // Handle error, e.g., redirect to login
            }
        };

        validateSession();
    }, []);

    return (
        <div>
            <h1>Protected</h1>
            {userName && <p>Welcome, {userName}!</p>}
        </div>
    );
};

export default Protected;