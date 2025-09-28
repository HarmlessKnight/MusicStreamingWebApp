'use client';

import { useRouter } from 'next/navigation'; 

import styles from './styles.module.css';
import RandomGradientBackground, { generateRandomColors } from '@/components/Gradients/RandomGradient';
import { useMemo } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import RadioIcon from '@/components/icons/RadioIcon';
import StreamingIcon from '@/components/icons/MusicstreamingIcon';


export default function PickPage() {

    const router = useRouter();
    
    const leftColors = useMemo(() => generateRandomColors(5), []);
    const rightColors = useMemo(() => generateRandomColors(5), []);

  return (
    <div className={styles.splitContainer}>

       <div className={styles.split + ' ' + styles.left}
       onClick={() => router.push('/streaming')}>
            <RandomGradientBackground colors={leftColors} />
            <div className={styles.content}>
                <StreamingIcon className={styles.Streamingicon}/>
                <div className={styles.glassText}>Show off your taste</div>
            </div>
        </div>


        <div className={styles.split + ' ' + styles.right}
            onClick={() => router.push('/radio')}>
            <RandomGradientBackground colors={rightColors} />
            
                <div className={styles.content}>
                    <RadioIcon className={styles.radioIcon} />
                    <div className={styles.glassText}>Just play some music</div>
                </div>

        </div>

      
    </div>
  );
}
