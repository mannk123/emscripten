#include <iostream>
#include <pthread.h>

void* worker_thread(void* arg)
{
    std::cout << "hello from the worker, run " << (int)arg << "!" << std::endl;

    return nullptr;
}

int main()
{
    std::cout << "hello from main!" << std::endl;

    for(int n = 0; n < 4; ++n)
    {
        pthread_t worker;
        pthread_create(&worker, NULL, worker_thread, (void*)n);
        pthread_join(worker, NULL);
    }    

    return 0;
}