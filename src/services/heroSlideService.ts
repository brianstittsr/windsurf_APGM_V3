'use client';

import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { HeroSlide, HeroSlideFormData } from '@/types/heroSlide';

const COLLECTION_NAME = 'heroSlides';

export const HeroSlideService = {
  async getAllSlides(): Promise<HeroSlide[]> {
    const q = query(collection(getDb(), COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    })) as HeroSlide[];
  },

  async getActiveSlides(): Promise<HeroSlide[]> {
    const slides = await this.getAllSlides();
    return slides.filter(slide => slide.isActive);
  },

  async createSlide(data: HeroSlideFormData): Promise<string> {
    const docRef = await addDoc(collection(getDb(), COLLECTION_NAME), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async updateSlide(id: string, data: Partial<HeroSlideFormData>): Promise<void> {
    const docRef = doc(getDb(), COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  async deleteSlide(id: string): Promise<void> {
    await deleteDoc(doc(getDb(), COLLECTION_NAME, id));
  },

  async reorderSlides(slideIds: string[]): Promise<void> {
    const updates = slideIds.map((id, index) => 
      updateDoc(doc(getDb(), COLLECTION_NAME, id), { order: index, updatedAt: Timestamp.now() })
    );
    await Promise.all(updates);
  }
};
