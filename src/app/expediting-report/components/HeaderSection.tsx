'use client';
import React from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { Button } from 'primereact/button';

const HeaderSection = () => {
  return (
    <div className="bg-card text-card-foreground relative flex h-[74px] w-full flex-col items-start justify-center gap-2.5 self-stretch rounded-xl px-6 py-4 shadow">
      <div className="relative flex flex-1 grow flex-col items-start justify-center gap-1">
        <div className="relative inline-flex flex-[0_0_auto] items-center gap-[75px]">
          <div className="relative w-fit text-lg font-bold text-black opacity-90">
            Supplier OTD View <span className="font-normal">( 12 Months )</span>
          </div>

          {/*  <div className='inline-flex items-center gap-4 relative flex-[0_0_auto]'>
                        <Button className='flex w-10 h-10 items-center justify-center p-2 bg-[#a6b6ca33] rounded-[32px] -rotate-90'>
                            <ArrowUpIcon className='w-4 h-4 rotate-90' />
                        </Button>

                        <div className='w-[89px] text-[#22783c] text-xl text-right'>1 Out&nbsp;&nbsp;of 4</div>

                        <Button className='flex w-10 h-10 items-center justify-center p-2 bg-[#a6b6ca33] rounded-[32px] rotate-90'>
                            <ArrowUpIcon className='w-4 h-4 -rotate-90' />
                        </Button>
                    </div> */}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
